# Config Synchronization Action

This action synchronizes configs in the repository to the config store.

## Inputs

### `configs-dir`

**Required** Root directory of the configs. Default `"./config"`.   
__Note__: only files with `json` extension are read.  
File Example (config/pup-service.json):
```
{
    "appId": "pup-service",
    "items": [
        {
            "keySuffix": "preferred_treats",
            "value": "experimental"
        },
        {
            "keySuffix": "who_is_the_best",
            "value": "hope"
        }
    ]
}
```
### `API Endpoint`

**Required**

### `username`

**Required**

### `password`

**Required**

## Outputs

### `status`

Status of the action execution. If action exits successfully, status is set to "done"

## Example usage

```yaml
uses: actions/config-sync-action@v0.1
with:
  configs-dir: './config'
  username: '<username>',
  password: '<password>
```