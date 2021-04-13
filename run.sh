# Run the script with ./run or sh run or bash run

clear
echo "Opening SAVi in Atom ..."
atom .
echo "Running Storyline Analysis Interface"
echo "Go to: localhost:8000"
python -m SimpleHTTPServer 8000
