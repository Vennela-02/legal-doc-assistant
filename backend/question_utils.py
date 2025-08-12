

def is_legal_question(question: str) -> bool:
    legal_keywords = [
        "agreement", "contract", "nda", "non-disclosure", "party", "breach",
        "clause", "liability", "obligation", "termination", "confidential",
        "rights", "duties", "compliance", "governing law", "jurisdiction"
    ]

    question_lower = question.lower()
    return any(keyword in question_lower for keyword in legal_keywords)


def is_summary_question(question: str) -> bool:
    """
    Returns True if the question looks like a summary-style query.
    """
    triggers = ["summarize", "summary", "document about"]
    question_lower = question.lower()
    return any(trigger in question_lower for trigger in triggers)

def is_legal_document(text: str) -> bool:
    """
    Basic check to validate if the uploaded document is legal-related.
    You can expand this with better rules later.
    """
    legal_keywords = [
        "agreement", "contract", "party", "clause", "non-disclosure",
        "nda", "terms", "obligations", "jurisdiction", "employment",
        "confidential", "liability", "termination", "breach"
    ]

    text_lower = text.lower()
    match_count = sum(keyword in text_lower for keyword in legal_keywords)

    return match_count >= 4  # You can tweak the threshold

