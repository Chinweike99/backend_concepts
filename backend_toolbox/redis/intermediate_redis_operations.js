import redis from 'redis'

const intermediateRedisOperations = async () => {
    const client =redis.createClient({url: "redis://localhost:6379"});

    await client.on("error", (error) => {
        console.log("Error", error);
    });

    try {
        await client.connect();
        //1.. HASH: Store object-like date
        await client.hSet('user:100', {
            username: "syntax sage",
            email: "syntaxsage@gmail.com",
            age: "27",
            active: "true"
        });

        // Get a single field from HASH
        const getName = await client.hGet("user:100", "username");
        console.log("user name", getName);

        // Get all field from a HASH
        const getAll = await client.hGetAll("user:100");
        console.log("Get all data: ", getAll);

        //Check if a field exists
        const hasAge = await client.hExists("user:100", 'age');
        console.log("Does user have age?", hasAge === 1);

        
        //2.. LIST: Ordered lists
        // Push elements to the right of the list
        await client.rPush('tasks', ['task1', 'task2', 'task3']);

        // Push elements to the left of the list 
        await client.lPush('tasks', ['task0', 'task1']);

        // Get list length
        const listLength = await client.lLen('tasks');
        console.log('Tasks list length:', listLength);
        
        // Get range of elements (all in this case)
        const allTasks = await client.lRange('tasks', 0, -1);
        console.log('All tasks:', allTasks);
        
        // Pop element from the right
        const lastTask = await client.rPop('tasks');
        console.log('Last task removed:', lastTask);
        
        //3.. SET: Unordered collection of unique elements
        await client.sAdd('tags', ['redis', 'database', 'nosql', 'cache']);

        // Add duplicate (will be ignored)
        await client.sAdd('tags', 'redis');

        // Get all set members
        const tags = await client.sMembers('tags');
        console.log("Tags: ", tags);

        // Check if element is in set
        const hasTag = await client.sIsMember('tags', 'nosql');
        console.log("Has nosql tag?", hasTag === 1);

        // Remove element from set
        await client.sRem("tags", "cache");
        const tagsAfterRemove = await client.sMembers('tags');
        console.log("Tags after removal : ", tagsAfterRemove);

        // 4.. SORTED SET:
        await client.zAdd("leaderboard", [
            {score: 100, value: "player 1"},
            {score: 85, value: "player 2"},
            {score: 95, value: "player 3"},
            {score: 110, value: "player 4"},
        ]);

        // Get top players (highest scores)
        const topPlayers = await client.zRange('leaderboard', 0, 2, {REV: true});
        console.log("Top 3 players: ", topPlayers);

        // Get players with scores
        const playerWithScores =  await client.zRangeWithScores('leaderboard', 0, -1, {REV: true});
        console.log("All players with scores: ", playerWithScores);

        // Get player rank (0-based);
        const playerRank = await client.zRank('leaderboard', 'player3');
        console.log("Player3 rank (from bottom):", playerRank);

        // Get player reversed rank(from top);
        const playerRevRank = await client.zRevRank('leaderboard', "player3");
        console.log("Player3 rank (from top)", playerRevRank)

        await client.quit();
        console.log("Intermediate redis connection closed")
    } catch (error) {
        console.log(error)
    }   

};

intermediateRedisOperations();