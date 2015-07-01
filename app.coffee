# Set device background 
Framer.Device.background.backgroundColor = "#303138"

# This imports all the layers for "test" into testLayers
testLayers = Framer.Importer.load "imported/test"

(require 'composer')

composer.app().center().clip = true

