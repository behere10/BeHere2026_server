const fs = require('fs');
const path = require('path');


const imagePath = '/images';
const localImagePath = '../wwwroot' + imagePath;


let imageList = [];
const imageListMAX = 100;


function formatTwoDigits(num)
{
    return String(num).padStart(2, '0');
}


function init()
{
    const now = new Date();

    for (let y = now.getFullYear(); y >= 2022; y--) {
        if (imageList.length >= imageListMAX) {
            break;
        }

        let yPath = '/' + y;
        if (!fs.existsSync(localImagePath + yPath)) {
            continue;
        }

        for (let m = 12; m >= 1; m--) {
            if (imageList.length >= imageListMAX) {
                break;
            }

            let mPath = yPath + '/' + formatTwoDigits(m);
            if (!fs.existsSync(localImagePath + mPath)) {
                continue;
            }

            for (let d = 31; d >= 1; d--) {
                if (imageList.length >= imageListMAX) {
                    break;
                }

                const dPath = mPath + '/' + formatTwoDigits(d);
                if (!fs.existsSync(localImagePath + dPath)) {
                    continue;
                }

                const files = fs.readdirSync(localImagePath + dPath);
                files.sort((a, b) => b.localeCompare(a));

                for (const file of files) {
                    const filePath = path.join(localImagePath + dPath, file);
                    const stat = fs.statSync(filePath);

                    if (stat.isFile()) {
                        imageList.push(path.join(imagePath + dPath, file));
                    }

                    if (imageList.length >= imageListMAX) {
                        break;
                    }
                }
            }
        }
    }

    console.log(imageList);
}


function getImageList()
{
    return imageList;
}


function newImage(path)
{
    imageList.unshift(path);

    while (imageList.length > imageListMAX) {
        imageList.pop();
    }
}


function saveImageToFile(mime, data, completeFunction)
{
    let ext = '';

    if (mime === 'image/png') {
        ext = '.png';
    }
    else if (mime === 'image/jpeg') {
        ext = '.jpg';
    }
    else {
        console.error('saveImageToFile: unknown MIME:', mime);
    }


    const now = new Date();

    let path = '/' + now.getFullYear()
             + '/' + formatTwoDigits(now.getMonth() + 1)
             + '/' + formatTwoDigits(now.getDate());

    let filename = '/'
                 + now.getFullYear()
                 + formatTwoDigits(now.getMonth() + 1)
                 + formatTwoDigits(now.getDate())
                 + '-'
                 + formatTwoDigits(now.getHours())
                 + formatTwoDigits(now.getMinutes())
                 + formatTwoDigits(now.getSeconds());

    fs.mkdir(localImagePath + path, { recursive: true }, (err) => {
        if (err) {
            console.error('ERROR: mkdir:', err);
            return;
        }


        let addition = '';

        while(fs.existsSync(localImagePath + path + filename + addition + ext)) {
            addition += 'a';
        }

        filename += addition + ext;


        fs.writeFile(localImagePath + path + filename, data, (err) => {
            if (err) {
                console.error('ERROR: writeFile:', err);
                return;
            }

            newImage(imagePath + path + filename);
            completeFunction(imagePath + path + filename);
        });
    });
}


module.exports = {
    init: init,
    getImageList: getImageList,
    saveImageToFile: saveImageToFile
}
