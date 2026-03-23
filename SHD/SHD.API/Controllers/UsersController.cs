using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ShdDbContext _context;

    public UsersController(ShdDbContext context)
    {
        _context = context;
    }

    // GET: api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int? orgUnitId)
    {
        var query = _context.Users
            .Include(u => u.OrgUnit)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => u.FirstName.Contains(search) || u.LastName.Contains(search));
        }

        if (orgUnitId.HasValue)
        {
            query = query.Where(u => u.OrgUnitId == orgUnitId);
        }

        return await query.ToListAsync();
    }

    // GET: api/users/5
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.OrgUnit)
            .Include(u => u.TaskAssignedToUsers)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }
}
