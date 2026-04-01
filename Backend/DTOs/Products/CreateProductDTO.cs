using System.ComponentModel.DataAnnotations;
using backend_yenir.Models.Enums;

namespace backend_yenir.DTOs.Products
{
    public class CreateProductDTO
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public int Category { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        [Required]
        public IFormFile Image { get; set; } = null!;

        [MaxLength(100)]
        public string? TypeMaterial { get; set; }

        [MaxLength(20)]
        public string? Size { get; set; }

        [MaxLength(50)]
        public string? TypeClothes { get; set; }

        [MaxLength(20)]
        public string? TypeGender { get; set; }

        public decimal? Height { get; set; }

        public decimal? Length { get; set; }

        public decimal? Width { get; set; }
    }
}
