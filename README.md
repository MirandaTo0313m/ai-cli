# ai-cli

AI CLI using Vercel AI Gateway

## Installation

```bash
npm install -g ai-cli
```

## Setup

```bash
ai init
```

Get your API key from [Vercel AI Gateway](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys&title=Go+to+AI+Gateway)

## Usage

```bash
ai                           # interactive mode
ai "hello"                   # single message
ai -m gpt-5 "hello"          # use specific model
ai -l                        # list available models
echo "explain this" | ai     # pipe input
```

## Options

- `-m, --model` - model (default: anthropic/claude-sonnet-4.5)
- `-l, --list` - list available models
- `-h, --help` - help

## Interactive Mode

Type `ai` to enter interactive mode with file access and chat history.

### Commands

**Chat**
- `/new` - start new chat
- `/chats` - list saved chats (paginated)
- `/chat <n>` - load chat by number
- `/delete` - delete current chat
- `/purge` - delete all chats
- `/clear`, `/c` - clear screen and history

**Context**
- `/context` - show token usage
- `/compress` - compress chat history
- `/summary` - view compressed summary
- `/usage` - show chat stats and cost

**Models**
- `/list`, `/l` - select model (with search)
- `/model`, `/m` - show current model

**Settings**
- `/permission` - set tool mode (ask/yolo)
- `/init`, `/i` - setup api key
- `/credits` - show balance
- `/storage` - show storage info
- `/help`, `/h` - show commands

**Exit**
- `exit` or `quit`

## File Tools

The AI can interact with files in your current directory:

- read files
- write/create files
- create folders
- rename/move files
- delete files
- copy files
- search in files
- find files by pattern
- get file info

Use `/permission` to switch between:
- **ask** (default) - confirms before write/delete operations
- **yolo** - no confirmations (use with caution)

## Switching Models

Supports fuzzy matching:

```bash
ai -m claude-4       # → anthropic/claude-sonnet-4
ai -m gpt-5          # → openai/gpt-5
ai -m sonnet         # → finds a sonnet model
```

## Storage

- Config: `~/.airc`
- Chats: `~/.ai-chats/`
