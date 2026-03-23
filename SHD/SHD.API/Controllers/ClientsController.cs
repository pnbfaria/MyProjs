using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ClientsController : ControllerBase
{
    private readonly ShdDbContext _context;

    public ClientsController(ShdDbContext context)
    {
        _context = context;
    }

    // GET: api/clients
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Client>>> GetClients(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Clients
            .Include(c => c.Feedbacks)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.FirstName.Contains(search) || c.LastName.Contains(search));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        Response.Headers.Append("X-Total-Count", totalItems.ToString());

        return Ok(items);
    }

    // GET: api/clients/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Client>> GetClient(int id)
    {
        var client = await _context.Clients
            .Include(c => c.Feedbacks)
                .ThenInclude(f => f.Status)
            .FirstOrDefaultAsync(c => c.ClientId == id);

        if (client == null)
        {
            return NotFound();
        }

        return client;
    }
}
