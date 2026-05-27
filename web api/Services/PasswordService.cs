using Entities;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Services
{
    public class PasswordService : IPasswordService
    {
        private readonly ILogger<PasswordService> _logger;

        public PasswordService(ILogger<PasswordService> logger)
        {
            _logger = logger;
        }
        public CheckPassword Check(string pass)
        {
            // Guard against null/empty input and protect against library exceptions
            if (string.IsNullOrEmpty(pass))
            {
                return new CheckPassword { Password = pass, Strength = 0 };
            }

            try
            {
                var result = Zxcvbn.Core.EvaluatePassword(pass);
                int strength = result?.Score ?? 0;
                // Ensure strength is within expected bounds (0-4)
                strength = Math.Clamp(strength, 0, 4);
                var passwordResult = new CheckPassword { Password = pass, Strength = strength };
                _logger.LogDebug("Password evaluated: Strength={Strength}", strength);
                return passwordResult;
            }
            catch (Exception ex)
            {
                // Log the exception and return a safe default
                _logger.LogError(ex, "Error evaluating password strength");
                return new CheckPassword { Password = pass, Strength = 0 };
            }
        }
    }
}
