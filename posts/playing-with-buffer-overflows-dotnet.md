---
layout: page
title: "Playing with buffer overflows in .NET"
permalink: /playing-with-buffer-overflows-dotnet
---
## Table of Contents
[Some text](#prerequisites)

## Prerequisites
.NET Framework
Visual Studio
Windbg

### Why and how?
Buffer overflows should not be possible in the C#/.NET world because they compile managed code. Thankfully there exists the *unsafe* keyword which will allow us to perform pointer operations on runtime memory.
