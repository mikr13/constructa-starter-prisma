Overview
The dependency injection system allows you to:

Pass runtime configuration variables to agents through a type-safe runtimeContext
Access these variables within tool execution contexts
Modify agent behavior without changing the underlying code
Share configuration across multiple tools within the same agent
Using runtimeContext with agents
Agents can access runtimeContext via the instructions parameter, and retrieve variables using runtimeContext.get(). This allows agent behavior to adapt dynamically based on user input or external configuration, without changing the underlying implementation.

src/mastra/agents/test-weather-agent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
 
export const testWeatherAgent = new Agent({
  name: "test-weather-agent",
  instructions: async ({ runtimeContext }) => {
    const temperatureUnit = runtimeContext.get("temperature-unit");
 
    return `You are a weather assistant that provides current weather information for any city.
 
    When a user asks for weather:
    - Extract the city name from their request
    - Respond with: temperature, feels-like temperature, humidity, wind speed, and conditions
    - Use ${temperatureUnit} for all temperature values
    - If no city is mentioned, ask for a city name
    `;
  },
  model: openai("gpt-4o-mini")
});
Example usage
In this example, temperature-unit is set using runtimeContext.set() to either celsius or fahrenheit, allowing the agent to respond with temperatures in the appropriate unit.

src/test-weather-agent.ts

import { mastra } from "./mastra";
import { RuntimeContext } from "@mastra/core/runtime-context";
 
const agent = mastra.getAgent("testWeatherAgent");
 
export type WeatherRuntimeContext = {
  "temperature-unit": "celsius" | "fahrenheit";
};
 
const runtimeContext = new RuntimeContext<WeatherRuntimeContext>();
 
runtimeContext.set("temperature-unit", "fahrenheit");
 
const response = await agent.generate("What's the weather in London?", {
  runtimeContext
});
 
console.log(response.text);
Accessing runtimeContext with server middleware
You can populate runtimeContext dynamically in server middleware by extracting information from the request. In this example, the temperature-unit is set based on the Cloudflare CF-IPCountry header to ensure responses match the user’s locale.

src/mastra/index.ts

import { Mastra } from "@mastra/core/mastra";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { testWeatherAgent } from "./agents/test-weather-agent";
 
type WeatherRuntimeContext = {
  "temperature-unit": "celsius" | "fahrenheit";
};
 
export const mastra = new Mastra({
  agents: { testWeatherAgent },
  server: {
    middleware: [
      async (context, next) => {
        const country = context.req.header("CF-IPCountry");
        const runtimeContext = context.get("runtimeContext") as RuntimeContext<WeatherRuntimeContext>;
 
        runtimeContext.set("temperature-unit", country === "US" ? "fahrenheit" : "celsius");
 
        await next();
      }
    ]
  }
});