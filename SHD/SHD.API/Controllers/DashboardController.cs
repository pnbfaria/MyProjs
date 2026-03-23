using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly ShdDbContext _context;

    public DashboardController(ShdDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData([FromQuery] string period = "mois")
    {
        var now = DateTime.Now;
        var startDate = period == "mois" ? new DateTime(now.Year, now.Month, 1) : new DateTime(now.Year, 1, 1);

        var totalFeedbacks = await _context.Feedbacks.CountAsync(f => f.ReceivedDate >= startDate);
        var natureDistribution = await _context.Feedbacks
            .Where(f => f.ReceivedDate >= startDate)
            .GroupBy(f => f.Type.Label)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync();

        var statusCounts = await _context.Feedbacks
            .Where(f => f.ReceivedDate >= startDate)
            .GroupBy(f => f.Status.Label)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var upcomingTasks = await _context.Tasks
            .Include(t => t.Status)
            .Where(t => t.DueDate >= now && t.Status.Label != "Clôturé")
            .OrderBy(t => t.DueDate)
            .Take(5)
            .ToListAsync();

        return Ok(new
        {
            TotalFeedbacks = totalFeedbacks,
            NatureDistribution = natureDistribution,
            StatusCounts = statusCounts,
            UpcomingTasks = upcomingTasks
        });
    }
}
