var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// In-memory task storage
var tasks = new List<TaskItem>
{
    new(1, "Learn React", false),
    new(2, "Build an API", false),
    new(3, "Connect front-end to back-end", true),
};
var nextId = 4;

// GET all tasks
app.MapGet("/api/tasks", () => Results.Ok(tasks));

// GET a single task
app.MapGet("/api/tasks/{taskId}", (int taskId) =>
{
    var task = tasks.FirstOrDefault(t => t.Id == taskId);
    return task is not null
        ? Results.Ok(task)
        : Results.NotFound(new { error = "Task not found" });
});

// POST a new task
app.MapPost("/api/tasks", (CreateTaskRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
        return Results.BadRequest(new { error = "Title is required" });

    var newTask = new TaskItem(nextId++, request.Title.Trim(), false);
    tasks.Add(newTask);
    return Results.Created($"/api/tasks/{newTask.Id}", newTask);
});

// PUT (update) a task
app.MapPut("/api/tasks/{taskId}", async (HttpContext context) =>
{
    var idString = context.Request.RouteValues["id"]?.ToString();

    if (!int.TryParse(idString, out var taskId))
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { error = "Task not found" });
        return;
    }

    var task = tasks.FirstOrDefault(t => t.Id == taskId);
    if (task is null)
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { error = "Task not found" });
        return;
    }

    var update = await context.Request.ReadFromJsonAsync<UpdateTaskRequest>();

    if (update?.Title is not null)
    {
        if (string.IsNullOrWhiteSpace(update.Title))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = "Title cannot be empty" });
            return;
        }
        task.Title = update.Title.Trim();
    }

    if (update?.Completed is not null)
        task.Completed = update.Completed.Value;

    await context.Response.WriteAsJsonAsync(task);
});

// DELETE a task
app.MapDelete("/api/tasks/{taskId}", async (int taskId, HttpContext context) =>
{
    var taskIndex = tasks.FindIndex(t => t.Id == taskId);

    if (taskIndex != -1)
    {
        var deleted = tasks[taskIndex];
        tasks.RemoveAt(taskIndex);
        await context.Response.WriteAsJsonAsync(new { message = "Task deleted", task = deleted });
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsJsonAsync(new { error = "Task not found" });
    }

    await context.Response.WriteAsJsonAsync(new { success = true });
});

app.Run("http://localhost:3001");

// ---------- Models ----------

record TaskItem(int Id, string Title, bool Completed)
{
    public string Title { get; set; } = Title;
    public bool Completed { get; set; } = Completed;
}

record CreateTaskRequest(string Title);
record UpdateTaskRequest(string? Title, bool? Completed);
