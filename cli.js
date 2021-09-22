#!/usr/bin/env node

const fs = require('fs')
const jimp = require('jimp')
const convert = require('@fiahfy/ico-convert').convert

const STD_L = 521
const envMap = [
    ['dev', `${__dirname}/assets/dev.png`],
    ['test', `${__dirname}/assets/test.png`],
    ['beta', `${__dirname}/assets/beta.png`],
    ['prod', `${__dirname}/assets/prod.png`],
    ['DEV', `${__dirname}/assets/dev.png`],
    ['TEST', `${__dirname}/assets/test.png`],
    ['BETA', `${__dirname}/assets/beta.png`],
    ['PROD', `${__dirname}/assets/prod.png`],
    [undefined, `${__dirname}/assets/undefined.png`],
]

const sourceImagePath = `${process.cwd()}/src/assets/images/favicon.png`
const faviconPath = `${process.cwd()}/public/favicon.ico`
const env = process.env.NODE_ENV

async function main() {
    try {
        if (!envMap.has(env)) return

        const badgeImagePath = envMap.get(env)
        const [source, badge] = await Promise.all([
            jimp.read(sourceImagePath),
            jimp.read(badgeImagePath),
        ])

        // use contain to resize image and keep its aspect ratio correct.
        await source.contain(STD_L, STD_L, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)

        const Y = source.getHeight() - badge.getHeight()
        const promisedBuffer = await source.composite(badge, 0, Y, [
            {
                mode: jimp.BLEND_SCREEN,
                opacitySource: 0.1,
                opacityDest: 1
            }
        ]).getBufferAsync('image/png')
        const promisedData  = await convert(promisedBuffer)
        await fs.promises.writeFile(faviconPath, promisedData)
        console.log('favicon generated successfully!')
    } catch (error) {
        console.log(error)
    }
}

main()