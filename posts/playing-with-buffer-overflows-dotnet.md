---
layout: page
title: "Playing with buffer overflows in .NET"
permalink: /playing-with-buffer-overflows-dotnet
---
**[8/2023]** [**@xamroot**](https://twitter.com/xamroot)
# Playing with buffer overflows in .NET
### Tools Used
.NET Framework
Visual Studio
Windbg

### Why and how?
Buffer overflows should not be possible in the C#/.NET world because they compile managed code. Thankfully there exists the *unsafe* keyword which will allow us to perform pointer operations on runtime memory. We are going to execute this, I have experience only with low level linux hacking. 


## Simple c# buffer overflow
```csharp
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

## Attempting to find the saved return address
Ran into the issue that the base pointer is VERY **VERY** far away from our **buffer** variable. Attempting to read 0xf0000 addresses past the **buffer** variable will eventually read a non-readable memory region, crashing the program. Further learning finds that C# local variables are not simply allocated onto the stack. For this, we need the **stackalloc** keyword. 

This is because the **new** keyword, following it's cpp standard, will instantiate the object in the heap.

![image](https://xamroot.github.io/assets/playing-with-buffer-overflows-dotnet/gates-smug.png)


## Stackalloc c# buffer overflow
```csharp
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

Only one line of code needed to be changed.

```csharp
long[] buffer = new long[bufferSize];
```

Becomes

```csharp
Span<long> buffer = stackalloc long[bufferSize];
```

## Another problem with overwriting the saved return address
Debugging the new stackalloc code shows the **buffer** variable is now a reasonable distance from the base pointer. The console output shows us the address of **buffer**. The base pointer address can be found while debugging in Visual Studio using the *registers* debug window.

We can actually find the saved return address by placing a breakingpoint before Main() goes into our exploitable code. Then once inside the exploitable function we can examine the stack and look for the return address.

The bytes between our controlled buffer and the saved return address is a fixed distance.

## WHY TF IS THERE AN Access Violation
Hijacking control flow, and redirecting the execution to Winner.Win() causes an Access Violation. Though, this access violation ONLY occurs on the call to the MethodStubDesc instruction. That is all to say that ROP chains could easily be used.

## Let's try a ROP chain
**pop rax; ret** @ 0x0000000140013c02
**pop rdi; ret** @ 0x0000000140001290

## What the hell is stackalloc
## Crafting the payload
