using System;
using System.IO;
using System.Threading.Tasks;

public static class FileLogger
{
    private static readonly object _lock = new object();
    private static readonly string _logPath = Path.Combine(Directory.GetCurrentDirectory(), "Logs");

    public static void WriteLog(string message)
    {
        try
        {
            if (!Directory.Exists(_logPath))
                Directory.CreateDirectory(_logPath);

            string fileName = $"Log_{DateTime.Now:yyyyMMdd}.txt";
            string fullPath = Path.Combine(_logPath, fileName);

            lock (_lock)
            {
                File.AppendAllText(fullPath, $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} => {message}{Environment.NewLine}");
            }
        }
        catch
        {
            // prevent crash if logging fails
        }
    }
}
