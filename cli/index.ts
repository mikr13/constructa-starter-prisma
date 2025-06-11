import dotenv from "dotenv"
import "dotenv/config"
import { execSync } from "node:child_process"
import { basename } from "node:path"
import * as p from "@clack/prompts"
import { blue, cyan, green, red, yellow } from "ansis"
import { defineCommand, runMain } from "citty"
dotenv.config()
// Helper function to run commands and log output
const runCommand = (command: string, description: string) => {
    console.log(
        blue(`
Running: ${description} (${command})`)
    )
    try {
        execSync(command, { stdio: "inherit" })
        console.log(green(`✅ Success: ${description}`))
    } catch (error: unknown) {
        // Type guard to check if error is an instance of Error
        if (error instanceof Error) {
            console.error(red(`❌ Error running ${description}: ${error.message}`))
        } else {
            console.error(red(`❌ Error running ${description}: An unknown error occurred`))
        }
        process.exit(1) // Exit if any command fails
    }
}

// Helper function to check if Docker is installed and running
const checkDocker = () => {
    console.log(blue("Checking Docker status..."))
    try {
        execSync("docker --version", { stdio: "pipe" }) // Check if docker command exists
    } catch (error) {
        console.error(red("❌ Error: Docker command not found. Please install Docker."), error)
        process.exit(1)
    }
    try {
        execSync("docker info", { stdio: "pipe" }) // Check if docker daemon is running
        console.log(green("✅ Docker is installed and running."))
    } catch (error) {
        console.error(red("❌ Error: Docker daemon is not running. Please start Docker."), error)
        process.exit(1)
    }
}

const initCommand = defineCommand({
    meta: {
        name: "init",
        description: "Initialize the project by installing dependencies and setting up services"
    },
    async run() {
        console.log(cyan("🚀 Starting project initialization..."))

        runCommand("pnpm install", "Install dependencies")
        checkDocker()
        console.log(yellow("ℹ️ Starting Docker containers. This might take a while..."))
        runCommand("docker compose up -d", "Start Docker containers")
        runCommand("npx drizzle-kit generate", "Generate Drizzle kit")
        runCommand("npx drizzle-kit migrate", "Run Drizzle migrations")
        runCommand(
            "npx -y @better-auth/cli@latest generate --config server/auth.ts --output server/db/auth.schema.ts",
            "Generate Better Auth schema"
        )

        console.log(cyan("🎉 Project initialization complete!"))
    }
})

const stopCommand = defineCommand({
    meta: {
        name: "stop",
        description: "Stop running Docker containers"
    },
    async run() {
        console.log(cyan("🛑 Stopping Docker containers..."))
        runCommand("docker compose down", "Stop Docker containers")
        console.log(cyan("✅ Docker containers stopped successfully"))
    }
})

const reloadCommand = defineCommand({
    meta: {
        name: "reload",
        description: "Reload Docker containers with updated configuration"
    },
    async run() {
        console.log(cyan("🔄 Reloading Docker containers..."))
        runCommand("docker compose down", "Stop and remove existing Docker containers")
        console.log(yellow("ℹ️ Starting Docker containers. This might take a while..."))
        runCommand("docker compose up -d", "Start Docker containers with updated configuration")
        console.log(cyan("✅ Docker containers reloaded successfully"))
    }
})

const recreateCommand = defineCommand({
    meta: {
        name: "recreate",
        description: "Recreate Docker containers and volume (WARNING: deletes all data!)"
    },
    async run() {
        // Dynamically determine the project name and volume name
        const projectName = basename(process.cwd())
        const volumeName = `${projectName}_ex0-data`

        // Use clack prompts for warning and confirmation
        p.log.warn(
            `🚨 WARNING: This command will stop containers, delete the associated volume (${volumeName}), and start fresh containers.`
        )
        p.log.error(`🚨 ALL DATA IN THE VOLUME WILL BE PERMANENTLY LOST.
`)

        const shouldRecreate = await p.confirm({
            message: "Are you absolutely sure you want to delete the volume and all its data?",
            initialValue: false
        })

        if (p.isCancel(shouldRecreate) || !shouldRecreate) {
            p.cancel("Operation cancelled.")
            return
        }

        const s = p.spinner()
        s.start("Recreating Docker containers and volume...")

        runCommand("docker compose down", "Stop and remove existing Docker containers")

        // Use the dynamic volume name in the remove command
        runCommand(`docker volume rm ${volumeName}`, `Remove Docker volume ${volumeName}`)

        runCommand("docker compose up -d", "Start fresh Docker containers")

        s.stop("✅ Docker containers and volume recreated successfully")

        p.outro(`Recreation complete for project '${projectName}'`)
    }
})

const testdataCommand = defineCommand({
    meta: {
        name: "testdata",
        description: "Create or delete seed test data in the database"
    },
    args: {
        create: {
            type: "boolean",
            description: "Insert the demo data",
            default: false
        },
        delete: {
            type: "boolean",
            description: "Remove the demo data",
            default: false
        }
    },
    async run({ args }) {
        if (args.create === args.delete) {
            console.error(red("Please specify exactly one of --create or --delete"))
            process.exit(1)
        }

        if (!process.env.DATABASE_URL) {
            console.error(red("DATABASE_URL environment variable is required"))
            process.exit(1)
        }

        const s = p.spinner()
        try {
            if (args.create) {
                s.start("Inserting test data...")
                const { createTestData } = await import("../server/db/test-data")
                await createTestData()
                s.stop(green("✅ Inserted test data"))
            } else {
                s.start("Deleting test data...")
                const { deleteTestData } = await import("../server/db/test-data")
                await deleteTestData()
                s.stop(green("✅ Deleted test data"))
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(red(`❌ ${error.message}`))
            } else {
                console.error(red("❌ Unknown error while managing test data"))
            }
            process.exit(1)
        }
    }
})

const deployCommand = defineCommand({
    meta: {
        name: "deploy",
        description: "[TODO] Deploy the application"
    },
    async run() {
        console.log(yellow("⚠️ Deploy command not implemented yet"))
    }
})

const main = defineCommand({
    meta: {
        name: "cli",
        version: "1.0.0",
        description: "Project management CLI"
    },
    subCommands: {
        init: initCommand,
        stop: stopCommand,
        reload: reloadCommand,
        recreate: recreateCommand,
        testdata: testdataCommand,
        deploy: deployCommand
    }
})

runMain(main)