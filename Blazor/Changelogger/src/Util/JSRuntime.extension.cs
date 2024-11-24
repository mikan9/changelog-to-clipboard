using Microsoft.JSInterop;

namespace Changelogger.Util;

public static class JSRuntimeExtension
{
    public static async Task LogAsync(this IJSRuntime js, params object?[]? args)
    {
        await js.InvokeVoidAsync("console.log", args);
    }

    public static void Log(this IJSRuntime js, params object?[]? args)
    {
        js.InvokeVoidAsync("console.log", args).AsTask();
    }
}