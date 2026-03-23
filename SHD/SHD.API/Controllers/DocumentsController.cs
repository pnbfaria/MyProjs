using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DocumentsController : ControllerBase
{
    private readonly ShdDbContext _context;

    public DocumentsController(ShdDbContext context)
    {
        _context = context;
    }

    // GET: api/documents/feedback/5
    [HttpGet("feedback/{feedbackId}")]
    public async Task<ActionResult<IEnumerable<Document>>> GetDocumentsForFeedback(int feedbackId)
    {
        return await _context.Documents
            .Where(d => d.FeedbackId == feedbackId)
            .ToListAsync();
    }

    // POST: api/documents
    [HttpPost]
    public async Task<ActionResult<Document>> PostDocument(Document document)
    {
        document.CreatedAt = DateTime.Now;
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDocumentsForFeedback), new { feedbackId = document.FeedbackId }, document);
    }

    // DELETE: api/documents/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var document = await _context.Documents.FindAsync(id);
        if (document == null)
        {
            return NotFound();
        }

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
