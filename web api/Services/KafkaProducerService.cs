using Confluent.Kafka;
using Microsoft.Extensions.Configuration;

namespace Services
{
    public class KafkaProducerService : IKafkaProducerService, IDisposable
    {
        private readonly IProducer<Null, string> _producer;
        private readonly string _topic;

        public KafkaProducerService(IConfiguration config)
        {
            _topic = config["Kafka:Topic"] ?? "order-transactions";

            var producerConfig = new ProducerConfig
            {
                BootstrapServers = config["Kafka:BootstrapServers"] ?? "localhost:9092"
            };

            _producer = new ProducerBuilder<Null, string>(producerConfig).Build();
        }

        public async Task PublishOrderAsync(string orderJson)
        {
            await _producer.ProduceAsync(_topic, new Message<Null, string> { Value = orderJson });
        }

        public void Dispose() => _producer.Dispose();
    }
}
