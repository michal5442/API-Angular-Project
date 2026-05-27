using Entities;

namespace Services
{
    public interface IPasswordService
    {
        CheckPassword Check(string pass);
    }
}