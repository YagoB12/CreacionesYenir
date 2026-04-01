namespace backend_yenir.DTOs.ShoppingCart
{
    public class ShoppingCartDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal Total { get; set; }
        public List<ShoppingCartItemDTO> Items { get; set; } = new();
    }
}
