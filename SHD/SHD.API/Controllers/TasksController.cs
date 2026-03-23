using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TasksController : ControllerBase
{
    private readonly ShdDbContext _context;

    public TasksController(ShdDbContext context)
    {
        _context = context;
    }

    // GET: api/tasks/feedback/5
    [HttpGet("feedback/{feedbackId}")]
    public async Task<ActionResult<IEnumerable<SHD.API.Models.Entities.Task>>> GetTasksForFeedback(int feedbackId)
    {
        return await _context.Tasks
            .Include(t => t.Status)
            .Include(t => t.AssignedToUser)
            .Where(t => t.FeedbackId == feedbackId)
            .ToListAsync();
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<ActionResult<SHD.API.Models.Entities.Task>> PostTask(SHD.API.Models.Dtos.CreateTaskDto dto)
    {
        var task = new SHD.API.Models.Entities.Task
        {
            FeedbackId = dto.FeedbackId,
            TaskName = dto.TaskName,
            AssignedToUserId = dto.AssignedToUserId,
            StartDate = dto.StartDate,
            DueDate = dto.DueDate,
            StatusId = dto.StatusId,
            IsHighPriority = dto.IsHighPriority,
            UpdatedAt = DateTime.Now
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        await _context.Entry(task).Reference(t => t.AssignedToUser).LoadAsync();
        await _context.Entry(task).Reference(t => t.Status).LoadAsync();

        return CreatedAtAction(nameof(GetTasksForFeedback), new { feedbackId = task.FeedbackId }, task);
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTask(int id, SHD.API.Models.Entities.Task task)
    {
        if (id != task.TaskId)
        {
            return BadRequest();
        }

        task.UpdatedAt = DateTime.Now;
        _context.Entry(task).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TaskExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    private bool TaskExists(int id)
    {
        return _context.Tasks.Any(e => e.TaskId == id);
    }
}
