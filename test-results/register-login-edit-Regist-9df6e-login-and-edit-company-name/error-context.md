# Page snapshot

```yaml
- generic [ref=e3]:
  - img "Bid&Go logo" [ref=e4]
  - generic [ref=e6]:
    - generic [ref=e7]:
      - heading "Sign In" [level=2] [ref=e8]
      - generic [ref=e9]:
        - text: Email
        - textbox "Email" [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e12]: Password
        - generic [ref=e13]:
          - textbox "Password" [ref=e14]
          - button "Show password" [ref=e15] [cursor=pointer]:
            - img [ref=e16]
      - generic [ref=e19]:
        - checkbox "Keep me signed in" [checked] [ref=e20]
        - generic [ref=e21]: Keep me signed in
      - button "Sign In" [ref=e22] [cursor=pointer]
      - link "Forgot your password?" [ref=e23] [cursor=pointer]:
        - /url: /recover
    - generic [ref=e24]:
      - generic [ref=e25]: Don’t have an account?
      - button "Register here" [ref=e26] [cursor=pointer]
```