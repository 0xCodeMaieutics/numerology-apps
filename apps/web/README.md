## Magick Mogrify

Down scale image size by 80%:
`magick mogrify -scale 80% ./public/universe.webp`

Convert png to webp
`magick mogrify -format webp ./public/universe.png`

## Redis query strategy

- RPUSH mylist 0 (push 0 into mylist)
- LRANGE mylist 0 -1 (get all elements from mylist)
- LRANGE mylist x x (get x-th element from the list)

##
- celebrities:<category>
- celebrities:stories



## Has Liked
- celebrities:<id>:users:<id>:liked
