# API Explorer
API Explorer is a web server that exposes the contents of a local `content` directory via a simple API. It allows clients to browse files and folders in a way similar to Microsoft Explorer, but through a web interface or API calls.

## Features

- Lists files and folders in the `content` directory, including subdirectories
- Provides a structured, explorer-like view for clients
- Hosts images, files, and scripts (JavaScript)
- Supports viewing and downloading files
- Text files are shown in a text viewer; other file types have dedicated viewers
- JavaScript files are analyzed for executability—if not executable, they're shown in the document viewer
- Any file can be downloaded by appending `?d` to the request
- Simple and easy to use API endpoints

## Usage

1. Place your files and folders inside the `content` directory. Subdirectories are supported.
2. Start the API Explorer server.
3. Access the API to browse, view, or download files and directories.

## Example

Suppose your `content` directory contains an `api` folder:

```
GET /api/list.json
```

Response:
```json
[
  { "name": "Documents", "type": "folder" },
  { "name": "image.png", "type": "file" },
  { "name": "script.js", "type": "file" }
]
```

To download a file:
```
GET /api/image.png?d
```

## Requirements

- Node.js (or your chosen runtime)
- Access to the `content` directory

## Permissions

Currently, all content is public. A permissions system is planned for future releases.

## License

MIT

## Contributing

Contributions are welcome! Please note that trivial changes will be denied. If you have suggestions or improvements, feel free to open an issue or submit a pull request. There are likely areas that can be improved, and your input is appreciated.