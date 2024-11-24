using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Changelogger.Services
{
    public class ClipboardService(IJSRuntime jSRuntime)
    {
        private readonly IJSRuntime _jsRuntime = jSRuntime;

        public ValueTask WriteHtmlAsync(ElementReference element) {
            return _jsRuntime.InvokeVoidAsync("window.copyHtmlToClipboard", element);
        }
    }
}