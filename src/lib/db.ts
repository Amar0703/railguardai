import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from '@tanstack/start';
import { GoogleGenAI, Type } from '@google/genai';

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type DefectStatus = "Pending" | "In Progress" | "Resolved";

export interface DefectRow {
  id: string;
  user_id: string;
  inspection_id: string | null;
  defect_type: string;
  severity: Severity;
  confidence: number;
  latitude: number;
  longitude: number;
  image_url: string | null;
  status: DefectStatus;
  created_at: string;
}

export interface InspectionRow {
  id: string;
  user_id: string;
  image_url: string;
  route_name: string;
  total_defects: number;
  created_at: string;
}

export interface TicketRow {
  id: string;
  user_id: string;
  defect_id: string | null;
  assigned_team: string;
  priority: Severity;
  status: DefectStatus;
  created_at: string;
}

export async function listDefects() {
  const { data, error } = await supabase
    .from("defects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DefectRow[];
}

export async function listInspections() {
  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as InspectionRow[];
}

export async function listTickets() {
  const { data, error } = await supabase
    .from("maintenance_tickets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TicketRow[];
}

export async function updateTicketStatus(id: string, status: DefectStatus) {
  const { error } = await supabase.from("maintenance_tickets").update({ status }).eq("id", id);
  if (error) throw error;
}

const ROUTES = [
  "Northern Corridor",
  "Eastern Line",
  "Western Express",
  "Southern Belt",
  "Central Junction",
];
const TEAMS = ["Alpha Crew", "Bravo Crew", "Delta Crew", "Echo Crew"];

interface GeminiDefectResult {
  defect_type: string;
  severity: Severity;
  confidence: number;
}

/**
 * Secure Server Function to invoke the Gemini 2.5 Flash API.
 * This runs isolated on the backend server environment protecting your API key.
 */
const runGeminiVisionAnalysis = createServerFn('POST', async (imageUrl: string) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY inside the system environment configs.");
    }

    // Initialize the official Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Fetch the binary data from your Supabase Storage signed URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error("Could not download uploaded track file from storage.");
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // 2. Direct Gemini to process the track image using strict structured output definitions
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            },
            {
              text: `You are an AI infrastructure inspector. Analyze this railway track image for structural anomalies.
              Look carefully for "Rail Crack", "Missing Bolt", "Loose Fastener", "Vegetation Overgrowth", "Track Misalignment", or "Rail Fracture".
              If the track is clear and pristine, return an empty array []`
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'A list of structural rail anomalies spotted on inspection target',
          items: {
            type: Type.OBJECT,
            properties: {
              defect_type: { 
                type: Type.STRING, 
                description: 'The standard defect tag name' 
              },
              severity: { 
                type: Type.STRING, 
                enum: ['Critical', 'High', 'Medium', 'Low'],
                description: 'The threat level priority tier' 
              },
              confidence: { 
                type: Type.NUMBER, 
                description: 'An evaluation confidence integer ranging from 0 to 100' 
              }
            },
            required: ['defect_type', 'severity', 'confidence']
          }
        }
      }
    });

    const resultsText = response.text() || '[]';
    const parsedData: GeminiDefectResult[] = JSON.parse(resultsText);
    return { success: true, data: parsedData };

  } catch (err: any) {
    console.error("Gemini pipeline processing exception error:", err);
    return { success: false, error: err.message, data: [] };
  }
});

export async function uploadInspection(file: File): Promise<{
  inspection: InspectionRow;
  defects: DefectRow[];
  tickets: TicketRow[];
}> {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) throw new Error("Not authenticated");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const up = await supabase.storage.from("railway-images").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (up.error) throw up.error;

  const { data: signed, error: signErr } = await supabase.storage
    .from("railway-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signErr) throw signErr;
  const imageUrl = signed.signedUrl;

  // --- SWAPPED: Calling the live Gemini AI model instead of mockDetect() ---
  const aiPayload = await runGeminiVisionAnalysis(imageUrl);
  
  // Map back data into your application pipeline layout
  const detections = (aiPayload.success ? aiPayload.data : []).map(defect => ({
    defect_type: defect.defect_type,
    severity: defect.severity,
    confidence: defect.confidence,
    // Maintain structural coordinate mapping logic for your dashboard charts/maps pins
    latitude: 22 + Math.random() * 8,
    longitude: 75 + Math.random() * 12,
  }));

  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];

  const { data: ins, error: insErr } = await supabase
    .from("inspections")
    .insert({
      user_id: user.id,
      image_url: imageUrl,
      route_name: route,
      total_defects: detections.length,
    })
    .select()
    .single();
  if (insErr) throw insErr;
  const inspection = ins as InspectionRow;

  const defectRows = detections.map((d) => ({
    ...d,
    user_id: user.id,
    inspection_id: inspection.id,
    image_url: imageUrl,
    status: "Pending" as DefectStatus,
  }));
  
  const { data: defs, error: defErr } = await supabase
    .from("defects")
    .insert(defectRows)
    .select();
  if (defErr) throw defErr;
  const defects = (defs ?? []) as DefectRow[];

  const ticketRows = defects.map((d) => ({
    user_id: user.id,
    defect_id: d.id,
    assigned_team: TEAMS[Math.floor(Math.random() * TEAMS.length)],
    priority: d.severity,
    status: "Pending" as DefectStatus,
  }));
  const { data: tks, error: tkErr } = await supabase
    .from("maintenance_tickets")
    .insert(ticketRows)
    .select();
  if (tkErr) throw tkErr;
  const tickets = (tks ?? []) as TicketRow[];

  return { inspection, defects, tickets };
}

export function severityClass(s: Severity) {
  switch (s) {
    case "Critical": return "bg-destructive/15 text-destructive border-destructive/30";
    case "High": return "bg-warning/15 text-warning border-warning/30";
    case "Medium": return "bg-primary/15 text-primary border-primary/30";
    case "Low": return "bg-success/15 text-success border-success/30";
  }
}
export function statusClass(s: DefectStatus) {
  switch (s) {
    case "Pending": return "bg-warning/15 text-warning border-warning/30";
    case "In Progress": return "bg-primary/15 text-primary border-primary/30";
    case "Resolved": return "bg-success/15 text-success border-success/30";
  }
}
export function severityColor(s: Severity) {
  switch (s) {
    case "Critical": return "var(--destructive)";
    case "High": return "var(--warning)";
    case "Medium": return "var(--primary)";
    case "Low": return "var(--success)";
  }
}