using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHD.API.Data;
using SHD.API.Models.Entities;

namespace SHD.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReferenceDataController : ControllerBase
{
    private readonly ShdDbContext _context;

    public ReferenceDataController(ShdDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<RefCategory>>> GetCategories()
    {
        return await _context.RefCategories.ToListAsync();
    }

    [HttpGet("channels")]
    public async Task<ActionResult<IEnumerable<RefChannel>>> GetChannels()
    {
        return await _context.RefChannels.ToListAsync();
    }

    [HttpGet("frequencies")]
    public async Task<ActionResult<IEnumerable<RefFrequency>>> GetFrequencies()
    {
        return await _context.RefFrequencies.ToListAsync();
    }

    [HttpGet("places")]
    public async Task<ActionResult<IEnumerable<RefPlace>>> GetPlaces()
    {
        return await _context.RefPlaces.ToListAsync();
    }

    [HttpGet("severities")]
    public async Task<ActionResult<IEnumerable<RefSeverity>>> GetSeverities()
    {
        return await _context.RefSeverities.ToListAsync();
    }

    [HttpGet("statuses")]
    public async Task<ActionResult<IEnumerable<RefStatus>>> GetStatuses()
    {
        return await _context.RefStatuses.ToListAsync();
    }

    [HttpGet("subjects")]
    public async Task<ActionResult<IEnumerable<RefSubject>>> GetSubjects()
    {
        return await _context.RefSubjects.ToListAsync();
    }

    [HttpGet("types")]
    public async Task<ActionResult<IEnumerable<RefType>>> GetTypes()
    {
        return await _context.RefTypes.ToListAsync();
    }

    [HttpGet("visibilities")]
    public async Task<ActionResult<IEnumerable<RefVisibility>>> GetVisibilities()
    {
        return await _context.RefVisibilities.ToListAsync();
    }

    [HttpGet("orgunits")]
    public async Task<ActionResult<IEnumerable<OrgUnit>>> GetOrgUnits()
    {
        return await _context.OrgUnits.ToListAsync();
    }
}
