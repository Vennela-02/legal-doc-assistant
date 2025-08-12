# from legalprompt import system_prompt

# def format_prompt(context: str, question: str, history_context: str = "") -> str:
#     with open("system_prompt.txt", "r", encoding="utf-8") as f:
#         system_prompt = f.read()

#     prompt = (
#         f"{system_prompt}\n\n"
#         "Include references to the [Source: ... - Page ...] in your answer wherever relevant.\n\n"
#         f"{history_context}\n\n"
#         f"--- DOCUMENT CONTEXT START ---\n{context}\n--- DOCUMENT CONTEXT END ---\n\n"
#         f"User Question: {question}\n\n"
#         "Answer:"
#     )
#     return prompt

from legalprompt import system_prompt as LEGAL_SYSTEM_PROMPT

def format_prompt(context: str, question: str, history_context: str = "") -> str:
    prompt = (
        f"{LEGAL_SYSTEM_PROMPT}\n\n"
        "Include references to the [Source: ... - Page ...] in your answer wherever relevant.\n\n"
        f"{history_context}\n\n"
        f"--- DOCUMENT CONTEXT START ---\n{context}\n--- DOCUMENT CONTEXT END ---\n\n"
        f"User Question: {question}\n\n"
        "Answer:"
    )
    return prompt

