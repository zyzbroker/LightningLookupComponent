# Another Lookup Control

This is a very basic simple lookup for the salesforce lightning design system. What it can do is

    * Look up A field and return the distinct values
    * Look up A field with sub title fields, it return those fields and show value as title and show sub title fields as dot separated sub title on the search result.
    * The lookup backend call can be debounced to reduce the server call when the typing is not completed yet.
    

![sample](/images/lookup.png)

## Note

The strike_lookup component is triggering the server trip too frequently. it kills the application component performance.

## Design Pattern

During the design phase, we are using the following pattern:

    * template pattern
    * gateway pattern on both frontend and backend.

The main goal to abstract out the detail of communication so that we can focus on app logic.
I have mentioned gateway pattern in another repository. 