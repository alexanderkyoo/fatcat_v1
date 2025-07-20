import { NextResponse } from "next/server";
import { fetchWeather } from "@/utils/fetchWeather";

export async function POST(request: Request) {
  console.log("\n🌤️ ========== WEATHER TOOL CALLED ==========");
  console.log("⏰ Timestamp:", new Date().toLocaleTimeString());
  
  const { parameters } = await request.json();
  console.log("📦 Raw parameters:", parameters);

  try {
    console.log("✅ Parsed weather parameters:", JSON.parse(parameters));
    const currentWeather = await fetchWeather(parameters);
    
    console.log("💬 Weather response to LLM:", currentWeather);
    console.log("🌤️ ========== WEATHER TOOL COMPLETE ==========\n");
    
    return NextResponse.json({ success: true, data: currentWeather });
  } catch (error) {
    console.error("❌ Error in fetchWeather API route:", error);
    console.log("🌤️ ========== WEATHER TOOL ERROR ==========\n");
    return NextResponse.json(
      { success: false, error: "Weather tool error" },
      { status: 500 },
    );
  }
}
