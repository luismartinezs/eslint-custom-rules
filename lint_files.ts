/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path'
import glob from 'glob'
import eslintConfig from './.eslintrc'

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color-change color of console
const errorLog = (data: string) => {
    console.log('\x1b[31m', data)
}

const warningLog = (data: string) => {
    console.log('\x1b[33m', data)
}

const successLog = (data: string) => {
    console.log('\x1b[32m', data)
}

const infoLog = (data: string) => {
    console.log('\x1b[34m', data)
}

(async function lintFiles() {
    infoLog('Linting files…')
    const cwd = process.cwd()
    const files = glob.sync('**/*', {
        cwd,
        ignore: ['node_modules/**', 'dist/**', '.vscode/**'],
        nodir: true
    })

    const errors: string[] = []
    const warnings: string[] = []
    // eslint-disable-next-line @typescript-eslint/no-var-requires

    const { ESLint } = require('eslint')
    const filesToLint = files.filter((file) => {
        const extension = path.extname(file)
        return ['.js', '.ts'].includes(extension)
    })
    // https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions
    const eslint = new ESLint({
        cwd,
        errorOnUnmatchedPattern: true,
        extensions: ['.ts', '.tsx', '.js'],
        allowInlineConfig: true,
        baseConfig: eslintConfig,
        rulePaths: [path.join(cwd, 'dist', 'lint_rules')],
        useEslintrc: true,
        fix: true
    })
    for (const file of filesToLint) {
        infoLog(`Checking ${file}`)
        const filePath = path.join(cwd, file)
        try {
            const lintResult = await eslint.lintFiles([filePath])
            await ESLint.outputFixes(lintResult)
            if (lintResult.length) {
                lintResult.forEach((r: any) => {
                    r.messages.forEach((m: any) => {
                        if (m.severity === 1) {
                            warnings.push(
                                `⚠️ ${`eslint(${m.ruleId || ''})`}-${m.message} at ${r.filePath}:${m.line}:${m.column}`
                            )
                        }
                        if (m.severity === 2) {
                            errors.push(
                                `❌ ${`eslint(${m.ruleId || ''})`}-${m.message} at ${r.filePath}:${m.line}:${m.column}`
                            )
                        }
                    })
                })
            }
        } catch (e) {
            errors.push((e as Error).message)
        }
    }
    if (warnings.length) {
        console.log('\x1b[33m', '\x1b[4m', 'Warnings..')
        console.log('%s\x1b[0m', '\t')
        for (const warning of warnings) {
            warningLog(warning)
            console.log()
        }
    }
    if (errors.length) {
        const error = 'Linting Failed:'
        console.log('\x1b[31m', '\x1b[4m', error)
        console.log('%s\x1b[0m', '\t')
        for (const err of errors) {
            errorLog(err)
            console.log()
        }
    } else {
        successLog('No linting issue found ✅.')
    }
}()).catch((e) => {
    errorLog(e.message)
    process.exit(1)
})