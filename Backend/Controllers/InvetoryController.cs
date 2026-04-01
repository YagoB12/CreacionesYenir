using System.ComponentModel.DataAnnotations;
using backend_yenir.Data;
using backend_yenir.DTOs.Inventory;
using backend_yenir.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    [Route("api/inventory")]
    [ApiController]
    [Authorize]
    public class InvetoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InvetoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Endpoint para agregar nuevos materiales al inventario
        // Solo accesible para usuarios con rol ADMIN
        // POST: api/inventory/create
        [HttpPost("create")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateMaterial([FromBody] CreateMaterialDTO dto)
        {
            if (dto.Name == null || dto.Name.Length > 100)
                return BadRequest(
                    "Se necesita que el material tenga por lo menos un nombre y que sea igual o menos a 100 digitos"
                );

            if (dto.Stock < 0)
                return BadRequest("No se puede ingresar un número negativo");

            if (dto.Description != null && dto.Description.Length > 500)
                return BadRequest("La descripción debe ser igual o menor a 500 dígitos");

            var nameExistis = _context.Inventories.Any(i => i.Name.ToLower() == dto.Name.ToLower());
            if (nameExistis)
                return BadRequest("El nombre de material ingresado ya existe");

            var inventory = new Inventory
            {
                Name = dto.Name,
                Descripcion = dto.Description,
                Stock = dto.Stock,
            };
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Material creado correctamente", productId = inventory.Id });
        }

        // Endpoint para obtener todos los materiales del inventario
        // Solo accesible para usuarios con rol ADMIN
        // GET: api/inventory
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAll()
        {
            var materials = await _context
                .Inventories.OrderBy(i => i.Name)
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.Descripcion,
                    i.Stock,
                })
                .ToListAsync();

            return Ok(
                new
                {
                    message = "Inventario obtenido correctamente",
                    count = materials.Count,
                    data = materials,
                }
            );
        }

        // Endpoint para actualizar un material del inventario
        // ============================
        // PUT: api/inventory/update/{id}
        // ============================
        [HttpPut("update/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateMaterial(int id, [FromBody] UpdateMaterialDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var inventory = await _context.Inventories.FindAsync(id);

            if (inventory == null)
                return NotFound("Material no encontrado");

            // Validaciones manuales
            if (!string.IsNullOrEmpty(dto.Name) && dto.Name.Length > 100)
                return BadRequest("El nombre debe ser igual o menor a 100 caracteres");

            // Validar nombre duplicado
            if (!string.IsNullOrEmpty(dto.Name) && dto.Name != inventory.Name)
            {
                var nameExists = await _context.Inventories.AnyAsync(i =>
                    i.Name == dto.Name && i.Id != id
                );

                if (nameExists)
                    return BadRequest("Ya existe un material con ese nombre");
            }

            if (dto.Stock.HasValue && dto.Stock < 0)
                return BadRequest("El stock no puede ser negativo");

            if (!string.IsNullOrEmpty(dto.Description) && dto.Description.Length > 500)
                return BadRequest("La descripción debe ser igual o menor a 500 caracteres");

            // Actualizar solo si vienen datos
            if (!string.IsNullOrEmpty(dto.Name))
                inventory.Name = dto.Name;

            if (dto.Stock.HasValue)
                inventory.Stock = dto.Stock.Value;

            if (dto.Description != null)
                inventory.Descripcion = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(
                new { message = "Material actualizado correctamente", materialId = inventory.Id }
            );
        }

        // Endpoint para eliminar materiales del inventario
        // Solo accesible para usuarios con rol ADMIN
        // DELTE: api/inventory/delete/{id}
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var material = await _context.Inventories.FindAsync(id);
            if (material == null)
                return NotFound("El material no se encuentra en la base de datos");

            _context.Inventories.Remove(material);
            await _context.SaveChangesAsync();
            return Ok("Se eliminó correctamente el material del inventario");
        }
    }
}
