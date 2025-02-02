import anthropic


def extract_text_from_textblock(text_block):
    # Extract the first TextBlock object from the list and access its 'text' field
    text = text_block[0].text if text_block and hasattr(text_block[0], 'text') else None
    return text


# Function to extract items and search prompts into a dictionary
def parse_search_prompts(text):
    # Remove the <search_prompts> tags from the input text
    search_prompts_section = text.strip().replace("<search_prompts>", "").replace("</search_prompts>", "").strip()

    # Initialize an empty dictionary
    item_dict = {}

    # Split the text into lines
    lines = search_prompts_section.split('\n')

    # Loop through each line and extract item and search prompt
    for line in lines:
        # Split the line by the first colon to separate the item and search prompt
        item, search_prompt = line.split(':', 1)
        item_dict[item.strip()] = search_prompt.strip()  # Store the item and prompt in the dictionary

    return item_dict

def generate_queries(user_prompt):
    client = anthropic.Anthropic(api_key="")


    # Prepare the assistant prompt
    system_prompt = "You are an expert assistant who provides clear, concise answers."
    assistant_prompt = f"""
    {user_prompt}
    
    You are tasked with creating search prompts for the text above as if searching on the IKEA website. The goal is to create search prompts for the items that the user has described, and these prompts should return relevant results directly on the IKEA website's search page.
    
    Guidelines for creating search prompts:
    - Use descriptive terms associated with the items the user wants.
    - Include the item type and its function.
    - Consider materials or finishes common in the decor described.
    - Keep the prompts concise but specific.
    
    The items to search for are:
    <items>
    {{items}}
    </items>
    
    For each item listed above, generate a search prompt that would be suitable for finding the items the user mentioned on the IKEA website. Be creative in combining the elements the user mentioned with IKEA's typical style.
    
    For each item listed above, generate a search prompt **without any additional explanation**. Follow this format exactly:
    <search_prompts>
    [Item 1]: [Search prompt for Item 1]
    [Item 2]: [Search prompt for Item 2]
    [Item 3]: [Search prompt for Item 3]
    </search_prompts>
    
    Just list the items and their search prompts, nothing more. Ensure the prompts are specific enough that they would return the correct results on the IKEA website.
    """
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": assistant_prompt
                    }
                ]
            }
        ]
    )
    '''
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",  # Ensure the model name is accurate
        max_tokens_to_sample=1024,
        prompt=f"{anthropic.HUMAN_PROMPT}{system_prompt}{anthropic.HUMAN_PROMPT}{assistant_prompt}{anthropic.AI_PROMPT}"
    )
    '''

    # Parse the input text
    item_search_dict = parse_search_prompts(extract_text_from_textblock(message.content))

    return item_search_dict


if __name__ == '__main__':
    userPrompt = """
    I’m thinking in the bedroom maybe a cozy platform bed with soft linen sheets, a couple of chunky wooden nightstands with warm bedside lamps, definitely a tall plant in the corner, some abstract art on the walls to keep things interesting, maybe a soft textured rug underfoot, and gotta have a reading nook with a comfy armchair and a little side table for coffee and books — oh, and blackout curtains for those glorious weekend sleep-ins.
    """
    print(generate_queries(userPrompt))