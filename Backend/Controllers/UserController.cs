using backend_yenir.Data;
using backend_yenir.DTOs.Auth;
using backend_yenir.Helpers;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context
                .Users.OrderByDescending(u => u.Role == UserRole.ADMIN)
                .ThenBy(u => u.Name)
                .ThenBy(u => u.LastName)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.LastName,
                    u.Email,
                    u.PhoneNumber,
                    u.Gender,
                    u.BirthDay,
                    u.Province,
                    u.Canton,
                    u.District,
                    u.ExactAddress,
                    Role = u.Role.ToString(),
                    u.CreatedAt,
                })
                .ToListAsync();
            return Ok(
                new
                {
                    message = "Usuarios obtenidos correctamente",
                    count = users.Count,
                    data = users,
                }
            );
        }

        // ============================
        // POST: api/users/create
        // ============================
        [HttpPost("create")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterUserDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var emailExists = _context.Users.Any(u => u.Email == dto.Email);
            if (emailExists)
                return BadRequest("El correo ya está registrado");

            var user = new User
            {
                Name = dto.Name,
                LastName = dto.LastName,
                BirthDay = dto.BirthDay,
                Email = dto.Email,
                PasswordHash = PasswordHasher.Hash(dto.Password),
                Role = UserRole.CLIENT,
                PhoneNumber = dto.PhoneNumber,
                Gender = dto.Gender,
                Province = dto.Province,
                Canton = dto.Canton,
                District = dto.District,
                ExactAddress = dto.ExactAddress,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Usuario registrado correctamente");
        }

        // ============================
        // PUT: api/users/update/{id}
        // ============================
        [HttpPut("update/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound("Usuario no encontrado");

            user.Name = dto.Name;
            user.LastName = dto.LastName;
            user.BirthDay = dto.BirthDay;
            user.PhoneNumber = dto.PhoneNumber;
            user.Gender = dto.Gender;
            user.Province = dto.Province;
            user.Canton = dto.Canton;
            user.District = dto.District;
            user.ExactAddress = dto.ExactAddress;

            await _context.SaveChangesAsync();

            return Ok("Usuario actualizado correctamente");
        }

        // ============================
        // PATCH: api/users/updateRole/{id}
        // ============================
        //endpoint para actualizar el rol de un usuario
        [HttpPatch("updateRole/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound("Usuario no encontrado");

            user.Role = dto.Role;

            await _context.SaveChangesAsync();

            return Ok("Rol actualizado correctamente");
        }

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("El usuario a eliminar no encontrado");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(
                new
                {
                    message = "Usuario eliminado correctamente",
                    userId = user.Id,
                    email = user.Email,
                }
            );
        }
    }
}
