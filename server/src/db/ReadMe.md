# Replacement Regex

```regex
"id": "[a-z0-9-]*",\n *"x": ([0-9.]*),\n *"y": ([0-9.]*),\n *"createdAt": "[0-9-T:.Z]*",\n *"updatedAt": "[0-9-T:.Z]*",\n *"LineupId": "[a-z0-9-]*",\n *"MemberId": "[a-z0-9-]*",\n *"Member": \{\n *"id": "[0-9a-z-]*",\n *"name": "[ a-zA-Z-äüö]*",\n *"nickname": ["a-zA-Z]*,\n *"abbreviation": "([a-zA-Z]*)",\n *"color": "#[a-fA-F0-9]*",\n *"createdAt": "[0-9-T:.Z]*",\n *"updatedAt": "[0-9-T:.Z]*",\n *"TeamId": "[0-9a-f-]*"\n *\}
```

```regex
"x": $1,
"y": $2,
"memberAbbreviation": "$3"
```
