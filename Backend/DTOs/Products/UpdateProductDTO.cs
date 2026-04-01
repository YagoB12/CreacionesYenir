using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Products
{
    public class UpdateProductDTO
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public int? Category { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        public decimal? Price { get; set; }

        public int? Stock { get; set; }

        public IFormFile? Image { get; set; }

        [MaxLength(100)]
        public string? TypeMaterial { get; set; }

        // Clothing
        [MaxLength(20)]
        public string? Size { get; set; }

        [MaxLength(50)]
        public string? TypeClothes { get; set; }

        [MaxLength(20)]
        public string? TypeGender { get; set; }

        // HomeAccessories
        public decimal? Height { get; set; }

        public decimal? Length { get; set; }

        public decimal? Width { get; set; }
    }
}
