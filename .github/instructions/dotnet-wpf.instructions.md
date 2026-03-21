---
applyTo: "**/*.{cs,xaml,csproj,sln,props,targets}"
description: "Use when working with .NET WPF code, XAML views, MVVM structure, data binding, commands, and UI responsiveness or accessibility."
---

# .NET WPF Instructions

## Project Style
- Target modern .NET and keep nullable reference types enabled.
- Prefer explicit types when they improve readability for public APIs and view model state.
- Keep methods short and focused; extract complex UI logic into services.

## WPF Architecture
- Use MVVM consistently: no business logic in code-behind.
- Keep code-behind limited to view-only concerns such as animation triggers or visual tree wiring.
- Prefer dependency injection for services consumed by view models.

## Bindings And Commands
- Default to `OneWay` for display-only properties and `TwoWay` only when user edits are required.
- Always raise property change notifications for bound state.
- Prefer `ICommand` implementations over click handlers for user actions.
- Use `ObservableCollection<T>` for list data shown in ItemsControls.

## Async And Threading
- Keep UI thread work minimal; move I/O and heavy processing off the dispatcher thread.
- Use async/await end-to-end and avoid blocking calls like `.Result` and `.Wait()`.
- Marshal UI updates back to the UI thread only when required.

## XAML Practices
- Keep XAML declarative and reusable; extract repeated UI into styles, templates, or user controls.
- Use `StaticResource` for stable resources and `DynamicResource` only when runtime theme switching is needed.
- Prefer compiled bindings where available to reduce runtime binding errors.

## Validation And Errors
- Implement input validation in view models, not views.
- Surface user-safe error messages and log detailed exception context for diagnostics.
- Avoid swallowing exceptions; handle expected failures explicitly.

## Performance
- Enable virtualization for large item lists.
- Avoid expensive converters in hot paths; cache where practical.
- Defer loading of non-critical data until after first render.

## Accessibility And UX
- Provide keyboard navigation and logical tab ordering.
- Ensure sufficient contrast and focus visibility.
- Add automation properties for key interactive controls.

## Testing
- Unit test view model behavior, command execution, and validation rules.
- Keep view models framework-light so they are testable without UI hosts.
- Add regression tests when fixing binding, threading, or command bugs.
