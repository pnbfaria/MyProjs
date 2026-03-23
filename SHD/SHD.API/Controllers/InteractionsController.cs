using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class InteractionsController : ControllerBase
{
    private readonly ShdDbContext _context;

    public InteractionsController(ShdDbContext context)
    {
        _context = context;
    }

    // GET: api/interactions/feedback/5
    [HttpGet("feedback/{feedbackId}")]
    public async Task<ActionResult<IEnumerable<Interaction>>> GetInteractionsForFeedback(int feedbackId)
    {
        return await _context.Interactions
            .Include(i => i.CreatedByUser)
            .Where(i => i.FeedbackId == feedbackId)
            .OrderByDescending(i => i.InteractionDate)
            .ToListAsync();
    }

    // POST: api/interactions
    [HttpPost]
    public async Task<ActionResult<Interaction>> PostInteraction(Interaction interaction)
    {
        interaction.UpdatedAt = DateTime.Now;
        _context.Interactions.Add(interaction);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInteractionsForFeedback), new { feedbackId = interaction.FeedbackId }, interaction);
    }
}
