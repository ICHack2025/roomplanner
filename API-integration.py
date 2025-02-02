import ikea_api_helper as iah
import furniture_prompt

# userPrompt = """
# I’m thinking in the bedroom maybe a cozy platform bed with soft linen sheets, a couple of chunky wooden nightstands with warm bedside lamps, definitely a tall plant in the corner, some abstract art on the walls to keep things interesting, maybe a soft textured rug underfoot, and gotta have a reading nook with a comfy armchair and a little side table for coffee and books — oh, and blackout curtains for those glorious weekend sleep-ins.
# """

# user_prompt = input("Please enter the user prompt: ")

# search_queries = furniture_prompt.generate_queries(user_prompt)
search_queries = {'Platform bed': 'wooden platform bed frame queen', 'Linen sheets': 'white linen duvet cover set', 'Wooden nightstands': 'solid wood bedside table', 'Bedside lamps': 'table lamp warm light wood base', 'Tall plant': 'artificial floor plant with pot', 'Abstract art': 'modern wall art print', 'Textured rug': 'plush bedroom area rug', 'Armchair': 'reading armchair upholstered', 'Side table': 'small round coffee table', 'Blackout curtains': 'room darkening curtain panels'}
results = {}
for key, query in search_queries.items():
    search_results = iah.ikea_search_items(query)
    for result in search_results:
        model_urls = iah.get_item_model(result)
        results[key] = model_urls

print(results)
print("Done")