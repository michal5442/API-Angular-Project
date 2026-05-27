using Confluent.Kafka;
using Microsoft.Extensions.Configuration;

IConfiguration configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();

string bootstrapServers = configuration["Kafka:BootstrapServers"]!;
string topic = configuration["Kafka:Topic"]!;
string groupId = configuration["Kafka:GroupId"]!;

var consumerConfig = new ConsumerConfig
{
    BootstrapServers = bootstrapServers,
    GroupId = groupId,
    AutoOffsetReset = AutoOffsetReset.Earliest,
    EnableAutoCommit = true
};

using var consumer = new ConsumerBuilder<Ignore, string>(consumerConfig).Build();
consumer.Subscribe(topic);

Console.WriteLine($"Kafka Consumer started. Listening on topic: {topic}");

CancellationTokenSource cts = new();
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    cts.Cancel();
};

try
{
    while (!cts.Token.IsCancellationRequested)
    {
        var result = consumer.Consume(cts.Token);
        Console.WriteLine("──────────────────────────────────────────");
        Console.WriteLine($"Topic     : {result.Topic}");
        Console.WriteLine($"Partition : {result.Partition.Value}");
        Console.WriteLine($"Offset    : {result.Offset.Value}");
        Console.WriteLine($"Timestamp : {result.Message.Timestamp.UtcDateTime:O}");
        Console.WriteLine($"Order     : {result.Message.Value}");
        Console.WriteLine("──────────────────────────────────────────");
    }
}
catch (OperationCanceledException)
{
    Console.WriteLine("Consumer shutting down...");
    consumer.Close();
}
