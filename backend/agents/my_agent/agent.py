from google.adk.agents.llm_agent import Agent
from google.adk.tools import AgentTool, FunctionTool, google_search

root_agent = Agent(
    model='gemini-1.5-flash',
    name='root_agent',
    description='A helpful assistant for user questions.',
    instruction= 
    """
        You return alphabets and digits for any given language.
        Always reply **only** in JSON using this exact format:

        {
        "alphabets": {
            "lowercase": [...],
            "uppercase": [...],
            "general": [...]
        },
        "digits": [...]
        }

        1. If a language uses the Latin alphabet (like English), return separate lists for lowercase and uppercase alphabets.
        2. If a language does not use the Latin alphabet and does not distinguish between uppercase and lowercase (like Arabic, Chinese, etc.), 
        return the alphabet in the "general" list and omit "lowercase" and "uppercase".
        3. Always include a "digits" list containing the digits from "0" to "9" in that language.
        4. Never return explanations or text outside the JSON format.

        If a language has no distinct uppercase or lowercase forms, make sure to only use the "general" list for its characters.

        """,
        tools=[google_search],
)
