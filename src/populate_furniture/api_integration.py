import ikea_api_helper as iah
import furniture_prompt
import model

# userPrompt = """
# I’m thinking in the bedroom maybe a cozy platform bed with soft linen sheets, a couple of chunky wooden nightstands with warm bedside lamps, definitely a tall plant in the corner, some abstract art on the walls to keep things interesting, maybe a soft textured rug underfoot, and gotta have a reading nook with a comfy armchair and a little side table for coffee and books — oh, and blackout curtains for those glorious weekend sleep-ins.
# """

# user_prompt = input("Please enter the user prompt: ")

# search_queries = furniture_prompt.generate_queries(user_prompt)
def search_model():
    search_queries = {'Table': ('corner', 'black table')}
    # TODO: LINK TOGETHER
    
    results = {}
    for key, (position, query) in search_queries.items():
        print(key, position)
        search_results = iah.ikea_search_items(query)
        for result in search_results:
            item_id = iah.get_item_model(result)
            colors = iah.get_item_colors(result)
            model_url = model.find_model(item_id, list(colors.values()))
            results[key] = model_url

    print(results)
    print("Done")