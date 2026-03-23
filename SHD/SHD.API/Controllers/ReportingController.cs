using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReportingController : ControllerBase
{
    private readonly ShdDbContext _context;

    public ReportingController(ShdDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetReportingData([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = _context.Feedbacks.AsQueryable();

        if (from.HasValue) query = query.Where(f => f.ReceivedDate >= from.Value);
        if (to.HasValue) query = query.Where(f => f.ReceivedDate <= to.Value);

        var stats = await query
            .GroupBy(f => f.Status.Label)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var trend = await query
            .Where(f => f.ReceivedDate != null)
            .GroupBy(f => new { Year = f.ReceivedDate.Value.Year, Month = f.ReceivedDate.Value.Month })
            .Select(g => new { Year = g.Key.Year, Month = g.Key.Month, Count = g.Count() })
            .OrderBy(g => g.Year).ThenBy(g => g.Month)
            .ToListAsync();

        return Ok(new
        {
            StatusDistribution = stats,
            MonthlyTrend = trend
        });
    }
}
