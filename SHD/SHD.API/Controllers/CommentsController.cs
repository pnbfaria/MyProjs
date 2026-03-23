using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CommentsController : ControllerBase
{
    private readonly ShdDbContext _context;

    public CommentsController(ShdDbContext context)
    {
        _context = context;
    }

    // GET: api/comments/feedback/5
    [HttpGet("feedback/{feedbackId}")]
    public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsForFeedback(int feedbackId)
    {
        return await _context.Comments
            .Include(c => c.AuthorUser)
            .Where(c => c.FeedbackId == feedbackId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // POST: api/comments
    [HttpPost]
    public async Task<ActionResult<Comment>> PostComment(SHD.API.Models.Dtos.CreateCommentDto dto)
    {
        var comment = new Comment
        {
            FeedbackId = dto.FeedbackId,
            Content = dto.Content,
            AuthorUserId = dto.AuthorUserId,
            CreatedAt = DateTime.Now
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        // Reload with AuthorUser
        await _context.Entry(comment).Reference(c => c.AuthorUser).LoadAsync();

        return CreatedAtAction(nameof(GetCommentsForFeedback), new { feedbackId = comment.FeedbackId }, comment);
    }
}
