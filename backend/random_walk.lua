math.randomseed(os.time())

--TODO: read the json file 'data.json' to gather fill in the following variables
Grid_Width = 50;
Grid_Height = 30;
Max_Tunnels = 80;
Max_Tunnel_Length = 20;

--TODO: Use the read data in order to generate a dungeon using the random walk technique
local function find_max_bounds(x, y, dx, dy, width, height, max_length)
    local length = 0

    while (length < max_length) do
        local new_x = x + dx * (length + 1)
        local new_y = y + dy * (length + 1)

        if (new_x < 1 or new_x > width or new_y < 1 or new_y > height) then
            break
        end

        length = length + 1
    end

    return length
end

local function rand_walk_generate(width, height, max_tunnels, max_length)

    if (width <= 0 or height <= 0 or max_tunnels <= 0 or max_length <= 1) then
        error("Invalid parameters for dungeon generation")
    end

    local x = math.random(width)
    local y = math.random(height)

    local curr_tunnels = 0
    local dungeon = {}

    for i = 1, height do
        dungeon[i] = {}
        for j = 1, width do
            dungeon[i][j] = 0
        end
    end

    while curr_tunnels < max_tunnels do
        local direction = math.random(4)
        local dx, dy = 0, 0

        if direction < 3 then
            dx = (direction == 1) and 1 or -1
        else
            dy = (direction == 3) and 1 or -1
        end

        local length = find_max_bounds(x, y, dx, dy, width, height, max_length)

        local len = 0

        for i = 1, length do
            if (x >= 1 and x <= width and y >= 1 and y <= height) then
                dungeon[y][x] = 1
                x = x + dx
                y = y + dy
                len = len + 1
            else
                break
            end
        end

        if (len ~= 0) then
            curr_tunnels = curr_tunnels + 1
        end

        direction = math.random(4)
        length = math.random(max_length)
    end

    return dungeon
end

local function print_dungeon(dungeon)
    for i = 1, #dungeon do
        for j = 1, #dungeon[i] do
            io.write(dungeon[i][j] == 1 and "#" or ".")
        end

        io.write("\n")
    end
end

print_dungeon(rand_walk_generate(Grid_Width, Grid_Height, Max_Tunnels, Max_Tunnel_Length))

--TODO: Write a method to export the dungeon to a file ('dungeon.json')