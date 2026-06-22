namespace Services
{
    public interface IKafkaProducerService
    {
        Task PublishOrderAsync(string orderJson);
    }
}
