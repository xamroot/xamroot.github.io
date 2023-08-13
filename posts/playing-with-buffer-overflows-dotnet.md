---
layout: page
title: "Playing with buffer overflows in .NET"
permalink: /playing-with-buffer-overflows-dotnet
---
## Table of Contents
[Introduction](#Introduction)

## Introduction
### Prerequisites
.NET Framework
Visual Studio
Windbg

### Why and how?
Buffer overflows should not be possible in the C#/.NET world because they compile managed code. Thankfully there exists the *unsafe* keyword which will allow us to perform pointer operations on runtime memory.


### Quick buffer overflow discussion
Quickly lets outline the approach to exploiting a buffer overflow (in the plain C context)
When a local variable is initialized in some function, the local variable's data will be placed onto the "stack" region of memory.
After finding code vulnerable to a buffer overflow you could then overwrite any data on the stack which follows the variable being abused.
Now the goal is to overwrite the "saved return address" which will be on the stack approx 0x10 bytes before the base pointer address (rbp/ebp). Once overwritten we can hijack the program's control flow.

That is all to say, we need to find and overwrite the return address.

## Simple c# buffer overflow
```
using System;
public class Program
{
    public static void Main()
    {
        const int bufferSize = 4;
        long[] buffer = new long[bufferSize];

        unsafe
        {
            fixed (long* bufferPtr = buffer)
            {
                long* endPtr = bufferPtr + bufferSize;

                // This loop attempts to write values beyond the buffer's boundaries.
                // It will write data to 2 additional places in memory (which are outside of the buffers boundaries)
                for (long* ptr = bufferPtr; ptr < endPtr + 2; ptr++)
                {
                    *ptr = 42; // Writing a value to memory using the pointer.
                }

                for (long i = 0; i < 32; ++i)
                {
                    long* ptr2 = bufferPtr + i;
                    string output = string.Format("{0} : {1}", ((IntPtr)ptr2).ToString("X"), (*ptr2).ToString("X"));
                    Console.WriteLine(output);
                }
            }
        }
    }
}
```

## Stackalloc c# buffer overflow
```
using System;
public class Program
{
    public static void Main()
    {
        const int bufferSize = 4;
        Span<long> buffer = stackalloc long[bufferSize];

        unsafe
        {
            fixed (long* bufferPtr = buffer)
            {
                long* endPtr = bufferPtr + bufferSize;

                // This loop attempts to write values beyond the buffer's boundaries.
                // It will write data to 2 additional places in memory (which are outside of the buffers boundaries)
                for (long* ptr = bufferPtr; ptr < endPtr + 2; ptr++)
                {
                    *ptr = 42; // Writing a value to memory using the pointer.
                }

                for (long i = 0; i < 32; ++i)
                {
                    long* ptr2 = bufferPtr + i;
                    string output = string.Format("{0} : {1}", ((IntPtr)ptr2).ToString("X"), (*ptr2).ToString("X"));
                    Console.WriteLine(output);
                }
            }
        }
    }
}
```