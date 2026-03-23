using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FeedbacksController : ControllerBase
{
    private readonly ShdDbContext _context;

    public FeedbacksController(ShdDbContext context)
    {
        _context = context;
    }

    // GET: api/feedbacks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Feedback>>> GetFeedbacks(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Feedbacks
            .Include(f => f.Status)
            .Include(f => f.Type)
            .Include(f => f.Client)
            .Include(f => f.OrgUnits)
            .Include(f => f.Severity)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(f => f.Status.Label == status);
        }

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(f => f.Type.Label == type);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(f => f.FeedbackNumber.Contains(search) || f.Description.Contains(search));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", totalItems.ToString());

        return Ok(items);
    }

    // GET: api/feedbacks/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Feedback>> GetFeedback(int id)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Status)
            .Include(f => f.Type)
            .Include(f => f.Client)
            .Include(f => f.OrgUnits)
            .Include(f => f.Severity)
            .Include(f => f.Category)
            .Include(f => f.Channel)
            .Include(f => f.Frequency)
            .Include(f => f.Place)
            .Include(f => f.Subject)
            .Include(f => f.Tasks).ThenInclude(t => t.AssignedToUser)
            .Include(f => f.Tasks).ThenInclude(t => t.Status)
            .Include(f => f.Comments).ThenInclude(c => c.AuthorUser)
            .FirstOrDefaultAsync(f => f.FeedbackId == id);

        if (feedback == null)
        {
            return NotFound();
        }

        return feedback;
    }

    // POST: api/feedbacks
    [HttpPost]
    public async Task<ActionResult<Feedback>> PostFeedback(SHD.API.Models.Dtos.CreateFeedbackDto dto)
    {
        // Auto-generate feedback number
        var maxId = await _context.Feedbacks.MaxAsync(f => (int?)f.FeedbackId) ?? 0;
        var feedbackNumber = $"FB-{(maxId + 1).ToString("D4")}";

        var feedback = new Feedback
        {
            FeedbackNumber = feedbackNumber,
            TypeId = dto.TypeId,
            SubjectId = dto.SubjectId,
            CategoryId = dto.CategoryId,
            ChannelId = dto.ChannelId,
            PlaceId = dto.PlaceId,
            ReceivedDate = dto.ReceivedDate,
            Description = dto.Description,
            ClientMoodScore = dto.ClientMoodScore,
            IsLitigation = dto.IsLitigation,
            StatusId = dto.StatusId,
            SeverityId = dto.SeverityId,
            FrequencyId = dto.FrequencyId,
            ClientId = dto.ClientId,
            CreatedByUserId = dto.CreatedByUserId,
            UpdatedAt = DateTime.Now,
        };

        // Resolve OrgUnits M2M
        if (dto.OrgUnitIds.Any())
        {
            var orgUnits = await _context.OrgUnits
                .Where(o => dto.OrgUnitIds.Contains(o.OrgUnitId))
                .ToListAsync();
            foreach (var ou in orgUnits)
                feedback.OrgUnits.Add(ou);
        }

        // Resolve Visibilities M2M
        if (dto.VisibilityIds.Any())
        {
            var visibilities = await _context.RefVisibilities
                .Where(v => dto.VisibilityIds.Contains(v.VisibilityId))
                .ToListAsync();
            foreach (var vis in visibilities)
                feedback.Visibilities.Add(vis);
        }

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetFeedback", new { id = feedback.FeedbackId }, feedback);
    }

    // PUT: api/feedbacks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutFeedback(int id, Feedback feedback)
    {
        if (id != feedback.FeedbackId)
        {
            return BadRequest();
        }

        feedback.UpdatedAt = DateTime.Now;
        _context.Entry(feedback).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!FeedbackExists(id))
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

    // DELETE: api/feedbacks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeedback(int id)
    {
        var feedback = await _context.Feedbacks.FindAsync(id);
        if (feedback == null)
        {
            return NotFound();
        }

        _context.Feedbacks.Remove(feedback);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool FeedbackExists(int id)
    {
        return _context.Feedbacks.Any(e => e.FeedbackId == id);
    }
}
