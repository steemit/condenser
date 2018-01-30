This HOC can be used to conditionally render a component based on a flag being present in the redux store.
If the flag is not present or if it is false a fallback component is rendered.

If you provide both children and a FlagComponent the children will be rendered.

Example Usage:

```
// Conditionally render wrapped Children
<ConnectedFlag
    flag="yup"
    Fallback={LoadingIndicator}
>
    <h1> Hello World </h1>
</ConnectedFlag>

// Explicitly Render a component.
<ConnectedFlag
    flag="yup"
    FlagComponent={<Icon name="user" />}
    Fallback={<LoadingIndicator/>}
/>

// If flag is false or not present, render a fallback
<ConnectedFlag
    flag="NOPE"
    FlagComponent={<Icon name="user" />}
    Fallback={<LoadingIndicator/>}
/>
```
